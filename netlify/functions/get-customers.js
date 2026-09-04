const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
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

    // DB 조회
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

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
    // 502로 죽지 않고 500 에러와 함께 원인 메시지 반환
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
