import axios, { type AxiosResponse } from "axios";
import { getCookie } from "cookies-next";

const commonPrefix = "/api/rabbit-mq";

/**
 * 백엔드에 자신의 아이디로 인스턴스를 생성하는 요청을 보냄
 * 백엔드는 해당 작업을 MQ에 넣음
 * @param resource_ip
 * @returns
 */
export async function requestCreateInstance(resource_ip: string = "127.0.0.1") {
  const routeName = "create-instance";
  const response = await axios.post(
    `${commonPrefix}/${routeName}`,
    {
      resource_ip: resource_ip,
    },
    {
      headers: {
        Authorization: `Bearer ${getCookie("jwt")}`,
      },
    }
  );
  return response.data;
}
