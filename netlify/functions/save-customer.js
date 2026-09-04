const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  // POST 요청만 허용
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    // 환경 변수 검증
    if (!supabaseUrl || !supabaseKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Supabase 환경 변수가 누락되었습니다.' }),
      };
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 전달받은 고객 데이터 파싱
    const customerData = JSON.parse(event.body);

    // Supabase customers 테이블에 저장 (upsert: 존재 시 업데이트, 없으면 추가)
    const { data, error } = await supabase
      .from('customers')
      .upsert([customerData])
      .select();

    if (error) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: error.message }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
