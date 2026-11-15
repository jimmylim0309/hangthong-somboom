const { createClient } = require("@supabase/supabase-js");

// Netlify 환경변수에서 Supabase 접속 정보 로드
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event) => {
  // CORS 헤더 설정
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const { id } = JSON.parse(event.body || "{}");

    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "삭제할 고객 ID가 필요합니다." }),
      };
    }

    // 1. 외래 키(Foreign Key) 제약조건 방지를 위해 해당 고객의 입금 내역 먼저 삭제
    const { error: depositError } = await supabase
      .from("deposits")
      .delete()
      .eq("customer_id", id);

    if (depositError) {
      console.error("입금 내역 삭제 오류:", depositError);
      throw new Error("고객의 입금 내역 삭제 중 오류가 발생했습니다: " + depositError.message);
    }

    // 2. 고객 테이블에서 해당 고객 삭제
    const { error: customerError } = await supabase
      .from("customers")
      .delete()
      .eq("id", id);

    if (customerError) {
      console.error("고객 삭제 오류:", customerError);
      throw new Error("고객 삭제 중 오류가 발생했습니다: " + customerError.message);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, deletedId: id }),
    };
  } catch (err) {
    console.error("delete-customer handler error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || "서버 오류가 발생했습니다." }),
    };
  }
};
