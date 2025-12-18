import { FaBullhorn } from "react-icons/fa";
import { Card } from "../ui/card";

export function AnnouncementCard() {
    return (
        <Card className="w-full h-fit p-2">
            <div className="flex items-center">

                <FaBullhorn />
                &nbsp;公告
            </div>
            <div className="mt-2">
                <p className="text-sm">这是一个用来记录与整理的地方。
                    笔记、经验，以及尚未想清楚的东西。</p>
            </div>


        </Card>
    )
}