export const getSessionSqlDay = `
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
		t1.trade_time = t.min_time LIMIT 1) as openPrice,
			(
	SELECT
		price
	FROM
		tradebook t1
	WHERE
		t1.trade_time = t.max_time LIMIT 1) as closePrice
FROM
	(
	SELECT
		trade_time as date_time,
		MIN(price) as low_price,
		MAX(price) as high_price,
		min(trade_time) as min_time,
		max(trade_time) as max_time
	FROM
		tradebook
	WHERE trade_time >= NOW() - INTERVAL 31 DAY AND trade_time <= NOW()
	GROUP BY
		DATE(trade_time)
	ORDER BY trade_time
	) t
`;
