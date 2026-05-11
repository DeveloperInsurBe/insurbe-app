import { buildTkPayload } from "@/app/providers/tk/mapper";
import { NextResponse } from "next/server";


const TOKEN_URL =
  "https://www.tk.de/service/rest/public/neuaufnahmeantrag/getApiAccessToken";

const SUBMIT_URL =
  "https://www.tk.de/service/rest/public/staging/neuaufnahmeantrag/v3/einreichen";

export async function POST(req: Request) {
    console.log("🔥 ROUTE HIT"); 

  try {
    const body = await req.json();

    /**
     * BUILD TK PAYLOAD
     */
    const payload = buildTkPayload(body);
    console.log("TK PAYLOAD:", JSON.stringify(payload, null, 2));


    /**
     * STEP 1 → GET TOKEN
     */
    const tokenResponse = await fetch(TOKEN_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        userId: process.env.TK_USER_ID,
        password: process.env.TK_PASSWORD,
      }),
    });

    const token = await tokenResponse.text();

    /**
     * STEP 2 → GET NSJ COOKIE
     */
    const setCookie =
      tokenResponse.headers.get("set-cookie") || "";

    const nsjMatch = setCookie.match(/nsj=([^;]+)/);

    const nsjCookie = nsjMatch?.[1];

    if (!nsjCookie) {
      return NextResponse.json(
        {
          success: false,
          error: "NSJ cookie not found",
        },
        { status: 400 }
      );
    }

    /**
     * STEP 3 → MULTIPART BODY
     */
    const boundary = "boundary123";

    const multipartBody = `
--${boundary}
Content-Type: application/json
Content-Disposition: form-data; name="antrag"

${JSON.stringify(payload)}

--${boundary}--
`;

    /**
     * STEP 4 → SUBMIT TO TK
     */
    const submitResponse = await fetch(SUBMIT_URL, {
      method: "POST",

      headers: {
        Authorization: `Bearer ${token}`,

        Cookie: `nsj=${nsjCookie}`,

        Accept: "application/json",

        "Content-Type": `multipart/mixed; boundary=${boundary}`,
      },

      body: multipartBody,
    });

    const result = await submitResponse.json();

    return NextResponse.json(result);
  } catch (error) {
    console.error("TK API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "TK submission failed",
      },
      { status: 500 }
    );
  }
}