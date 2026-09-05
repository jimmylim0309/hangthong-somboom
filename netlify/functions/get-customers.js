const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Supabase 환경 변수가 누락되었습니다.' }),
      };
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. 고객 목록 조회
    const { data: customers, error: customerError } = await supabase
      .from('customers')
      .select('*');

    if (customerError) {
      console.error('Customer Fetch Error:', customerError);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: customerError.message }),
      };
    }

    // 2. 입금 목록 조회
    const { data: deposits, error: depositError } = await supabase
      .from('deposits')
      .select('*');

    if (depositError) {
      console.error('Deposit Fetch Error:', depositError);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: depositError.message }),
      };
    }

    // 3. 각 고객 데이터에 해당 고객의 deposits 매핑
    const result = (customers || []).map(customer => {
      const customerIdStr = String(customer.id || customer._id);
      const userDeposits = (deposits || []).filter(
        d => String(d.customer_id) === customerIdStr
      );
      return {
        ...customer,
        deposits: userDeposits
      };
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result),
    };

  } catch (err) {
    console.error('Function Execution Error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
