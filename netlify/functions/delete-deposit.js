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

    if (!body.id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '삭제할 입금 ID가 누락되었습니다.' }),
      };
    }

    const { data, error } = await supabase
      .from('deposits')
      .delete()
      .eq('id', body.id);

    if (error) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: error.message }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: '삭제 완료' }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
