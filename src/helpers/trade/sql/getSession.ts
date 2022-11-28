export const getSessionSql = `
SELECT
	t.date_time as tradeTime,
	t.low_price as lowPrice,
	t.high_price as highPrice,
	(
	SELECT
		price
	FROM
		tradebook t1
	WHERE
		t1.trade_time = t.min_time) as openPrice,
			(
	SELECT
		price
	FROM
		tradebook t1
	WHERE
		t1.trade_time = t.max_time) as closePrice
FROM
	(
	SELECT
		DATE_FORMAT(trade_time, '%d-%m %H:%i') date_time,
		MIN(price) as low_price,
		MAX(price) as high_price,
		min(trade_time) as min_time,
		max(trade_time) as max_time
	FROM
		tradebook
	WHERE trade_time >= NOW() - INTERVAL 1 DAY
	GROUP BY
		DATE(trade_time), HOUR(trade_time)) t
`;
