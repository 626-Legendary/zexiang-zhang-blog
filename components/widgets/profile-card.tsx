import { FaLinkedin } from "react-icons/fa";
import { FaRss } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";
import { MdEmail } from "react-icons/md"
import Link from "next/link";

import { Card } from "../ui/card";
import { FaLocationDot } from "react-icons/fa6";
import Image from "next/image";
export function ProfileCard() {
    return (
        <Card className="w-full h-fit p-2 ">

            <Image
                src="/avatar.jpg"
                alt="avatar"
                width={100}
                height={100}
                className="mx-auto mt-8 w-24 h-24 rounded-full object-cover"
            />

            <div className="font-bold text-xl text-center">
                ZEXIANG ZHANG
            </div>
            <div className="text-center text-sm">
                坚持不自律，本身也是一种自律。
            </div>
            <div className="flex justify-center items-center text-xs mt-12">
                <FaLocationDot /> &nbsp;Los Angeles Metropolitan Area
            </div>
            <div className="flex justify-center gap-4 mb-4">
                <Link href={"https://www.linkedin.com/in/zexiang-zhang-9842b6160/"} target="_blank">
                    <FaLinkedin />
                </Link>

                <Link href={"https://github.com/626-Legendary"} target="_blank">
                    <FaGithub />
                </Link>

                <Link href={"zhangzexiang626@gmail.com"} target="_blank">
                    <MdEmail />
                </Link>

                <Link href={"#"} target="_blank">
                    <FaRss />
                </Link>

                
                
                
            </div>
        </Card>
    )
}