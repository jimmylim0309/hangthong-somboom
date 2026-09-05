const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  // CORS 및 HTTP 메소드 검증
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
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
    const body = JSON.parse(event.body || '{}');

    // DB의 created_at 컬럼으로 매핑되도록 수정
    const payload = {
      customer_id: body.customer_id || body.customerId,
      serial: body.serial || '',
      amount: Number(body.amount),
      memo: body.memo || body.note || '',
      created_at: body.date || body.created_at || new Date().toISOString()
    };

    // id가 명시되어 넘어온 경우에만 포함 (수정 작업 시 사용)
    if (body.id) {
      payload.id = body.id;
    }

    // Supabase DB 저장/수정 실행
    const { data, error } = await supabase
      .from('deposits')
      .upsert([payload], { onConflict: 'id' })
      .select();

    if (error) {
      console.error('Supabase Upsert Error:', error);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: error.message }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
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
