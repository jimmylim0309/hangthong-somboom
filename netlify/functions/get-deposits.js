const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  // CORS 및 응답 헤더 설정
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Preflight(OPTIONS) 요청 대응
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
    const params = event.queryStringParameters || {};
    
    const serial = params.serial;
    const customerId = params.customer_id || params.customerId;

    // 기본 쿼리 생성 (최신순 정렬 추가)
    let query = supabase
      .from('deposits')
      .select('*')
      .order('date', { ascending: false });

    // 파라미터 조건 분기 (serial 또는 customer_id 검색 대응)
    if (serial) {
      query = query.eq('serial', serial);
    } else if (customerId) {
      query = query.eq('customer_id', customerId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase Fetch Error:', error);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: error.message }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data || []),
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
