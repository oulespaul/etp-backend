export const getTradeConfirmationWithTradeDetail = `
SELECT
	tbc.id as tradeConfirmationId,
	tb.incoming_account_no as userId,
	tbc.orderbook_id as transactionId,
	tbc.tradebook_id as refId,
	tbc.status as status,
	tbc.trn_usage as trnUsage,
	tbc.total as tradeTotal,
	tbc.timestamp as timestamp
FROM
	tradebook_confirmation tbc
	LEFT JOIN tradebook tb ON tb.trade_id = tbc.tradebook_id
WHERE
	tbc.is_stamp_blocked = 0
LIMIT 1
`;
