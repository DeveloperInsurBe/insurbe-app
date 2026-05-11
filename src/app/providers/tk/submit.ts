import { buildTkPayload } from "./mapper";

const TOKEN_URL =
  "https://www.tk.de/service/rest/public/neuaufnahmeantrag/getApiAccessToken";

const SUBMIT_URL =
  "https://www.tk.de/service/rest/public/staging/neuaufnahmeantrag/v3/einreichen";

export const submitTkApplication = async (formData: any) => {
  try {
    /**
     * STEP 1 → GET TOKEN
     */
    const tokenResponse = await fetch(TOKEN_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        userId: process.env.NEXT_PUBLIC_TK_USER_ID,
        password: process.env.NEXT_PUBLIC_TK_PASSWORD,
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
      throw new Error("NSJ cookie not found");
    }

    /**
     * STEP 3 → BUILD PAYLOAD
     */
    const payload = buildTkPayload(formData);

    /**
     * STEP 4 → MULTIPART BODY
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
     * STEP 5 → SUBMIT APPLICATION
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

    console.log("TK RESULT:", result);

    return result;
  } catch (error) {
    console.error("TK SUBMIT ERROR:", error);

    throw error;
  }
};