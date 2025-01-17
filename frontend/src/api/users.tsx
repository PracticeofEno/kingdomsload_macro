import { common } from "@mui/material/colors";
import axios, { type AxiosResponse } from "axios";
import { getCookie } from "cookies-next";
import { json } from "stream/consumers";

const commonPrefix = "/api/users";

/**
 * 로그인 요청
 * @param id
 * @param pw
 * @returns JWT Token
 */
export async function login(id: string, pw: string) {
  const response = await axios.post(`/api/auth/login`, {
    user_id: id,
    user_pw: pw,
  });
  return response.data;
}

/**
 * 회원 생성 요청
 * @param id
 * @param pw
 * @returns
 */
export async function register(id: string, pw: string) {
  console.log(`${commonPrefix} + /`);
  const response = await axios.post(`${commonPrefix}/`, {
    user_id: id,
    user_pw: pw,
  });
  return response.data;
}

/**
 * User 정보를 가져옴
 * @param include
 * include 쿼리가 있을 경우 포함할 형태
 * 'none' | 'all' | 'macro' | 'instance'
 * @returns User 정본
 */
export async function getUser(query: string = "none") {
  const response = await axios.get(`${commonPrefix}?include=${query}`, {
    headers: {
      Authorization: `Bearer ${getCookie("jwt")}`,
    },
  });
  return response.data;
}

/**
 * 진행 로그 가져오기
 * @returns 
 */
export async function getProgressLogs() {
  const response = await axios.get(`/api/logs/progress`, {
    headers: {
      Authorization: `Bearer ${getCookie("jwt")}`,
    },
  });
  return response.data;
}

/**
 * 장수 로그 가져오기
 * @returns 
 */
export async function getGeneralLogs() {
  const response = await axios.get(`/api/logs/general`, {
    headers: {
      Authorization: `Bearer ${getCookie("jwt")}`,
    },
  });
  return response.data;
}

/**
 * 삼전 로그인 등록요청 보냄(수동)
 * @param login_id
 * @param login_pw
 * @param kinds
 * @returns
 */
export async function notRegisteredYet(
  login_id: string,
  login_pw: string,
  kinds: string = "Qookka"
) {
  const response = await axios.post(
    `${commonPrefix}/not-registered-yet`,
    {
      kinds: kinds,
      login_id: login_id,
      login_pw: login_pw,
    },
    {
      headers: {
        Authorization: `Bearer ${getCookie("jwt")}`,
      },
    }
  );
  return response.data;
}

/**
 * 대쉬보드용 매크로 시간을 가져오는 함수
 * @returns
 */
export async function getMacroTime() {
  const response = await axios.get(`${commonPrefix}/macro-time`);
  return response.data;
}

export async function getMacroData() {
  const response = await axios.get(`${commonPrefix}/macro-data`, {
    headers: {
      Authorization: `Bearer ${getCookie("jwt")}`,
    },
  });
  return response.data;
}

/**
 * MacroData 테이블 설정 요청
 * @param data
 * @returns
 */
export async function setMacroData(data: any) {
  const response = await axios.post(
    `${commonPrefix}/macro-data`,
    {
      tax: data.tax,
      recruit: data.recruit,
      subscribe: data.subscribe,
      exploration: data.exploration,
      trial: data.trial,
    },
    {
      headers: {
        Authorization: `Bearer ${getCookie("jwt")}`,
      },
    }
  );
  return response.data;
}

/**
 * 현재 시간을 다음 실행시간으로 설정하는걸 요청하는 함수
 */
export async function registNextExcuteTime() {
  const response = await axios.post(`${commonPrefix}/mq`,{},
    {
      headers: {
        Authorization: `Bearer ${getCookie("jwt")}`,
      },
  });
  return response.data;
}

/**
 * 다음 실행시간을 제거하는 함수
 */
export async function removeNextExecuteTime() {
  const response = await axios.delete(`${commonPrefix}/mq`, {
    headers: {
      Authorization: `Bearer ${getCookie("jwt")}`,
    },
  });
  return response.data;
}