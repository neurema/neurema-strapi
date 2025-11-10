/**
 * user-topic controller
 */

import { factories } from '@strapi/strapi';

type RawUserTopicInput = Record<string, unknown>;

interface SanitizedUserTopicInput {
	clientKey: string;
	topicId: number;
	profileId: number;
	memoryLocation?: string | null;
	lastSession?: string | null;
	nextSession?: string | null;
	timeTotal?: number | null;
	timeRemaining?: number | null;
	revisionsDone?: number | null;
}

const toOptionalIsoString = (value: unknown): string | null => {
	if (value === null || value === undefined) {
		return null;
	}
	if (value instanceof Date && !Number.isNaN(value.valueOf())) {
		return value.toISOString();
	}

	const asString = value.toString().trim();
	if (!asString) {
		return null;
	}

	const parsed = new Date(asString);
	if (Number.isNaN(parsed.valueOf())) {
		return null;
	}

	return parsed.toISOString();
};

const toOptionalNumber = (value: unknown): number | null => {
	if (value === null || value === undefined) {
		return null;
	}

	if (typeof value === 'number' && Number.isFinite(value)) {
		return value;
	}

	const parsed = Number.parseInt(value.toString(), 10);
	return Number.isFinite(parsed) ? parsed : null;
};

const toRequiredNumber = (value: unknown): number | null => {
	if (typeof value === 'number' && Number.isFinite(value)) {
		return value;
	}

	if (value === null || value === undefined) {
		return null;
	}

	const parsed = Number.parseInt(value.toString(), 10);
	return Number.isFinite(parsed) ? parsed : null;
};

const sanitizeBulkUserTopicEntry = (input: RawUserTopicInput): SanitizedUserTopicInput | null => {
	const topicId =
		toRequiredNumber(input.topicId) ??
		toRequiredNumber((input.topic as Record<string, unknown> | undefined)?.id) ??
		toRequiredNumber(input.topic);

	const profileId =
		toRequiredNumber(input.profileId) ??
		toRequiredNumber((input.profile as Record<string, unknown> | undefined)?.id) ??
		toRequiredNumber(input.profile);

	if (!topicId || !profileId) {
		return null;
	}

	const clientKeyRaw = input.clientKey;
	const clientKey = clientKeyRaw ? clientKeyRaw.toString() : `${profileId}:${topicId}`;

	return {
		clientKey,
		topicId,
		profileId,
		memoryLocation:
				input.memoryLocation === null || input.memoryLocation === undefined
					? null
					: input.memoryLocation.toString(),
		lastSession: toOptionalIsoString(input.lastSession),
		nextSession: toOptionalIsoString(input.nextSession),
		timeTotal: toOptionalNumber(input.timeTotal),
		timeRemaining: toOptionalNumber(input.timeRemaining),
		revisionsDone: toOptionalNumber(input.revisionsDone),
	};
};

const buildCreatePayload = (input: SanitizedUserTopicInput) => {
	const data: Record<string, unknown> = {
		topic: input.topicId,
		profile: input.profileId,
	};

	if (input.memoryLocation !== undefined) data.memoryLocation = input.memoryLocation;
	if (input.lastSession) data.lastSession = input.lastSession;
	if (input.nextSession) data.nextSession = input.nextSession;
	if (input.timeTotal !== null && input.timeTotal !== undefined) data.timeTotal = input.timeTotal;
	if (input.timeRemaining !== null && input.timeRemaining !== undefined) {
		data.timeRemaining = input.timeRemaining;
	}
	if (input.revisionsDone !== null && input.revisionsDone !== undefined) {
		data.revisionsDone = input.revisionsDone;
	}

	return data;
};

const buildUpdatePayload = (input: SanitizedUserTopicInput) => {
	const data: Record<string, unknown> = {};

	if (input.memoryLocation !== undefined) data.memoryLocation = input.memoryLocation;
	if (input.lastSession) data.lastSession = input.lastSession;
	if (input.nextSession) data.nextSession = input.nextSession;
	if (input.timeTotal !== null && input.timeTotal !== undefined) data.timeTotal = input.timeTotal;
	if (input.timeRemaining !== null && input.timeRemaining !== undefined) {
		data.timeRemaining = input.timeRemaining;
	}
	if (input.revisionsDone !== null && input.revisionsDone !== undefined) {
		data.revisionsDone = input.revisionsDone;
	}

	return data;
};

const attachTransaction = <T>(repository: T, trx: unknown): T => {
    const repo = repository as unknown as { transacting?: (transaction: unknown) => unknown };
    if (typeof repo.transacting === 'function') {
        return repo.transacting(trx) as T;
    }
    return repository;
};

export default factories.createCoreController('api::user-topic.user-topic', ({ strapi }) => ({
	async bulkSync(ctx) {
		const payload = ctx.request.body?.data;

		if (!Array.isArray(payload)) {
			ctx.badRequest('The request body must include a "data" array.');
			return;
		}

		const sanitizedEntries = payload
			.map((item) => sanitizeBulkUserTopicEntry(item as RawUserTopicInput))
			.filter((entry): entry is SanitizedUserTopicInput => entry !== null);

		if (!sanitizedEntries.length) {
			ctx.body = { data: [] };
			return;
		}

		const responses: Array<{
			clientKey: string;
			userTopicId: number;
			topicId: number;
			created: boolean;
		}> = [];

		await strapi.db.transaction(async ({ trx }) => {
			const query = attachTransaction(strapi.db.query('api::user-topic.user-topic'), trx);

			const pendingCreates: Array<{
				input: SanitizedUserTopicInput;
				data: Record<string, unknown>;
			}> = [];

			for (const entry of sanitizedEntries) {
				const existing = await query.findOne({
					where: {
						topic: entry.topicId,
						profile: entry.profileId,
					},
					select: ['id'],
				});

				if (existing) {
					const updatePayload = buildUpdatePayload(entry);
					if (Object.keys(updatePayload).length) {
						await query.update({
							where: { id: existing.id },
							data: updatePayload,
						});
					}
					responses.push({
						clientKey: entry.clientKey,
						userTopicId: existing.id,
						topicId: entry.topicId,
						created: false,
					});
					continue;
				}

				pendingCreates.push({
					input: entry,
					data: buildCreatePayload(entry),
				});
			}

			if (!pendingCreates.length) {
				return;
			}

			const createPayload = pendingCreates.map(({ data }) => data);
			let createdIds: number[] = [];

			if (createPayload.length > 1) {
				try {
					const bulkResult = await query.createMany({ data: createPayload });
					if (Array.isArray(bulkResult?.ids) && bulkResult.ids.length === createPayload.length) {
						createdIds = bulkResult.ids as number[];
					}
				} catch (error) {
					strapi.log.warn(
						`[user-topic] bulk createMany failed, falling back to sequential create. Error: ${error}`,
					);
				}
			}

			if (createdIds.length !== createPayload.length) {
				createdIds = [];
				for (const payloadEntry of createPayload) {
					const created = await query.create({ data: payloadEntry });
					createdIds.push(created.id as number);
				}
			}

			pendingCreates.forEach((pending, index) => {
				const createdId = createdIds[index];
				if (typeof createdId !== 'number') {
					throw new Error('Failed to resolve newly created user-topic id.');
				}
				responses.push({
					clientKey: pending.input.clientKey,
					userTopicId: createdId,
					topicId: pending.input.topicId,
					created: true,
				});
			});
		});

		ctx.body = { data: responses };
	},
}));
