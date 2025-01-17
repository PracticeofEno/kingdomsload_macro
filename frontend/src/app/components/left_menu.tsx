import { getUser } from "@/api/users";
import { User } from "@/util_type";
import { setCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaCogs, FaServer, FaSignOutAlt } from "react-icons/fa";

export default function LeftMenu() {
    const [user, setUser] = useState<User>();
    const router = useRouter();
    async function logout() {
        setCookie("jwt", "", { expires: new Date(0) });
        router.push("/");
    }
    useEffect(() => {
      async function init() {
        const user = await getUser();
        // console.log(user);
        setUser(user);
      }
      init();
    }, [])

    return (
        <div className="flex flex-col w-[20%] h-full text-center bg-gray-100 shadow-md">
            {/* 만료 상태 */}
            <div className="flex flex-col w-full h-[12%] justify-center items-center text-center border-b border-gray-300">
              <span className={`font-semibold text-lg ${user?.is_expired ? 'text-red-500' : 'text-blue-500'}`}>
                {user?.is_expired ? "만료됨" : "사용 가능"} 
                <br/>
              </span>
              {
                user?.expired_at && (
                  "만료일 : " +  new Date(user.expired_at).toLocaleDateString()
                )
              }
            </div>
            {/* 인스턴스 메뉴 */}
            <div
              className="flex w-full h-[12%] justify-center items-center text-center border-b border-gray-300 
              hover:bg-gradient-to-r hover:from-blue-400 hover:to-purple-500 hover:text-white cursor-pointer 
              transition-all duration-300 ease-in-out transform"
              onClick={() => {
                router.push("/instance");
              }}
            >
              <FaServer className="mr-2" size={20} /> {/* 아이콘 */}
              <span className="font-semibold text-lg">인스턴스</span>
            </div>
            
            {/* 기능 메뉴 */}
            <div
              className="flex w-full h-[12%] justify-center items-center text-center border-b border-gray-300 
              hover:bg-gradient-to-r hover:from-green-400 hover:to-teal-500 hover:text-white cursor-pointer 
              transition-all duration-300 ease-in-out transform"
              onClick={() => {
                router.push("/macro");
              }}
            >
              <FaCogs className="mr-2" size={20} /> {/* 아이콘 */}
              <span className="font-semibold text-lg">매크로 설정</span>
            </div>
            {/* 로그아웃 */}
            <div
              className="flex w-full h-[12%] justify-center items-center text-center border-b border-gray-300 
              hover:bg-gradient-to-r hover:from-yellow-400 hover:to-red-500 hover:text-white cursor-pointer 
              transition-all duration-300 ease-in-out transform"
              onClick={() => {
                logout();
              }}
            >
              <FaSignOutAlt className="mr-2" size={20} /> {/* 아이콘 */}
              <span className="font-semibold text-lg">로그아웃</span>
            </div>
      </div>
    )
}