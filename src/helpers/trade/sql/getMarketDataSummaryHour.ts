export const getMarketDataSummaryHour = `
SELECT
	t.date_time AS tradeTime,
	t.sum_quantity AS sumQuantity,
	t.buy_quantity AS buyQuantity,
	t.sell_quantity AS sellQuantity,
	t.avg_price AS avgPrice,
	(t.avg_price * t.sum_quantity) AS value,
	(
		SELECT
			price
		FROM
			tradebook t1
		WHERE
			t1.trade_time = t.max_time
		LIMIT 1) AS lastPrice
FROM (
	SELECT
		trade_time AS date_time,
		SUM(quantity) AS sum_quantity,
		AVG(price) AS avg_price,
		min(trade_time) AS min_time,
		max(trade_time) AS max_time,
		sum(case when incoming_order_side = 'buy' then quantity else null end) as buy_quantity,
		sum(case when incoming_order_side = 'sell' then quantity else null end) as sell_quantity
	FROM
		tradebook
	WHERE
		trade_time >= NOW() - INTERVAL 1 DAY
		AND trade_time <= NOW()) t`;
