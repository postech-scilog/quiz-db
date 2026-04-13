/* 데이터베이스 테이블 `assets` 의 한 행. */
export interface AssetsTableRow {
  name: string;
  data: Buffer;
}

/* 데이터베이스 테이블 `questions` 의 한 행. */
export interface QuestionsTableRow {
  id: string;
  year: number;
  subject: string;
  question_text: string;
  short_answer: string;
  long_answer_text: string;
}

/* JSON 형식으로 표현 가능한 타입들.
출처: https://github.com/microsoft/TypeScript/issues/1897#issuecomment-331765301 */
export type JSONSerializable = JSONPrimitive | JSONObject | JSONArray;
type JSONPrimitive = boolean | number | string | null;
type JSONObject = { [member: string]: JSONSerializable };
interface JSONArray extends Array<JSONSerializable> {}
