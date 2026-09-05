const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

exports.handler = async (event, context) => {
  try {
    // 1. 고객 목록 조회
    const { data: customers, error: custError } = await supabase
      .from('customers')
      .select('*');

    if (custError) throw custError;

    // 2. 입금 목록 전체 조회
    const { data: deposits, error: depError } = await supabase
      .from('deposits')
      .select('*');

    if (depError) throw depError;

    // 3. serial 또는 id 기준으로 deposits를 customers에 바인딩
    const result = customers.map(customer => {
      // customer_id에 serial(1234)이 들어간 경우와 customer.id가 들어간 경우 모두 대응
      const customerDeposits = deposits.filter(d => 
        String(d.customer_id) === String(customer.serial) ||
        String(d.customer_id) === String(customer.id) ||
        String(d.serial) === String(customer.serial)
      );

      return {
        ...customer,
        // app.js 호환을 위해 id가 없으면 serial을 id로 사용
        id: customer.id || customer.serial, 
        deposits: customerDeposits
      };
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result)
    };
  } catch (err) {
    console.error("get-customers error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
