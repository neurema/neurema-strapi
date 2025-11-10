/**
 * study-session controller
 */

import { factories } from '@strapi/strapi';

type RawSessionInput = Record<string, unknown>;

interface SanitizedSessionInput {
	clientKey: string;
	userTopicId: number;
	scheduledFor: string;
	isPaused: boolean;
	timeTakenForRevision?: number | null;
	timeTakenForActivity?: number | null;
	timeAllotted?: number | null;
	scoreActivity?: string | null;
	difficultyLevel?: string | null;
}

const toBoolean = (value: unknown, fallback = false): boolean => {
	if (typeof value === 'boolean') return value;
	if (value === null || value === undefined) return fallback;
	if (typeof value === 'number') return value !== 0;
	const normalized = value.toString().trim().toLowerCase();
	if (!normalized) return fallback;
	return ['true', '1', 'yes', 'y'].includes(normalized);
};

const toIsoString = (value: unknown): string | null => {
	if (value === null || value === undefined) {
		return null;
	}

	if (value instanceof Date && !Number.isNaN(value.valueOf())) {
		return value.toISOString();
	}

	const asString = value.toString().trim();
	if (!asString) return null;

	const parsed = new Date(asString);
	if (Number.isNaN(parsed.valueOf())) {
		return null;
	}

	return parsed.toISOString();
};

const toOptionalNumber = (value: unknown): number | null => {
	if (value === null || value === undefined) return null;
	if (typeof value === 'number' && Number.isFinite(value)) return value;
	const parsed = Number.parseInt(value.toString(), 10);
	return Number.isFinite(parsed) ? parsed : null;
};

const toRequiredNumber = (value: unknown): number | null => {
	if (typeof value === 'number' && Number.isFinite(value)) return value;
	if (value === null || value === undefined) return null;
	const parsed = Number.parseInt(value.toString(), 10);
	return Number.isFinite(parsed) ? parsed : null;
};

const sanitizeSessionEntry = (input: RawSessionInput): SanitizedSessionInput | null => {
	const userTopicId =
		toRequiredNumber(input.userTopicId) ??
		toRequiredNumber((input.user_topic as Record<string, unknown> | undefined)?.id) ??
		toRequiredNumber(input.user_topic);

	const scheduledFor = toIsoString(input.scheduledFor);

	if (!userTopicId || !scheduledFor) {
		return null;
	}

	const clientKeyRaw = input.clientKey;
	const clientKey = clientKeyRaw ? clientKeyRaw.toString() : `${userTopicId}:${scheduledFor}`;

	return {
		clientKey,
		userTopicId,
		scheduledFor,
		isPaused: toBoolean(input.isPaused),
		timeTakenForRevision: toOptionalNumber(input.timeTakenForRevision),
		timeTakenForActivity: toOptionalNumber(input.timeTakenForActivity),
		timeAllotted: toOptionalNumber(input.timeAllotted),
		scoreActivity:
			input.scoreActivity === null || input.scoreActivity === undefined
				? null
				: input.scoreActivity.toString(),
		difficultyLevel:
			input.difficultyLevel === null || input.difficultyLevel === undefined
				? null
				: input.difficultyLevel.toString(),
	};
};

const buildSessionCreatePayload = (input: SanitizedSessionInput) => {
	const data: Record<string, unknown> = {
		user_topic: input.userTopicId,
		scheduledFor: input.scheduledFor,
		isPaused: input.isPaused,
	};

	if (input.timeTakenForRevision !== null && input.timeTakenForRevision !== undefined) {
		data.timeTakenForRevision = input.timeTakenForRevision;
	}
	if (input.timeTakenForActivity !== null && input.timeTakenForActivity !== undefined) {
		data.timeTakenForActivity = input.timeTakenForActivity;
	}
	if (input.timeAllotted !== null && input.timeAllotted !== undefined) {
		data.timeAllotted = input.timeAllotted;
	}
	if (input.scoreActivity !== null && input.scoreActivity !== undefined) {
		data.scoreActivity = input.scoreActivity;
	}
	if (input.difficultyLevel !== null && input.difficultyLevel !== undefined) {
		data.difficultyLevel = input.difficultyLevel;
	}

	return data;
};

const buildSessionUpdatePayload = (input: SanitizedSessionInput) => {
	const data: Record<string, unknown> = {
		isPaused: input.isPaused,
		scheduledFor: input.scheduledFor,
	};

	if (input.timeTakenForRevision !== null && input.timeTakenForRevision !== undefined) {
		data.timeTakenForRevision = input.timeTakenForRevision;
	}
	if (input.timeTakenForActivity !== null && input.timeTakenForActivity !== undefined) {
		data.timeTakenForActivity = input.timeTakenForActivity;
	}
	if (input.timeAllotted !== null && input.timeAllotted !== undefined) {
		data.timeAllotted = input.timeAllotted;
	}
	if (input.scoreActivity !== null && input.scoreActivity !== undefined) {
		data.scoreActivity = input.scoreActivity;
	}
	if (input.difficultyLevel !== null && input.difficultyLevel !== undefined) {
		data.difficultyLevel = input.difficultyLevel;
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

export default factories.createCoreController('api::study-session.study-session', ({ strapi }) => ({
	async bulkSync(ctx) {
		const payload = ctx.request.body?.data;

		if (!Array.isArray(payload)) {
			ctx.badRequest('The request body must include a "data" array.');
			return;
		}

		const sanitizedEntries = payload
			.map((item) => sanitizeSessionEntry(item as RawSessionInput))
			.filter((entry): entry is SanitizedSessionInput => entry !== null);

		if (!sanitizedEntries.length) {
			ctx.body = { data: [] };
			return;
		}

		const responses: Array<{
			clientKey: string;
			sessionId: number;
			userTopicId: number;
			created: boolean;
		}> = [];

		await strapi.db.transaction(async ({ trx }) => {
			const query = attachTransaction(strapi.db.query('api::study-session.study-session'), trx);

			const pendingCreates: Array<{
				input: SanitizedSessionInput;
				data: Record<string, unknown>;
			}> = [];

			for (const entry of sanitizedEntries) {
				const existing = await query.findOne({
					where: {
						user_topic: entry.userTopicId,
						scheduledFor: entry.scheduledFor,
					},
					select: ['id'],
				});

				if (existing) {
					const updatePayload = buildSessionUpdatePayload(entry);
					await query.update({
						where: { id: existing.id },
						data: updatePayload,
					});

					responses.push({
						clientKey: entry.clientKey,
						sessionId: existing.id,
						userTopicId: entry.userTopicId,
						created: false,
					});
					continue;
				}

				pendingCreates.push({
					input: entry,
					data: buildSessionCreatePayload(entry),
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
						`[study-session] bulk createMany failed, falling back to sequential create. Error: ${error}`,
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
					throw new Error('Failed to resolve newly created session id.');
				}
				responses.push({
					clientKey: pending.input.clientKey,
					sessionId: createdId,
					userTopicId: pending.input.userTopicId,
					created: true,
				});
			});
		});

		ctx.body = { data: responses };
	},
}));
