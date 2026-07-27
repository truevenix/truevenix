import { Poppins } from "next/font/google"
import { cn } from "@/lib/utils";

const font = Poppins({
    subsets: ["latin"],
    weight: ["600"],
});

interface HeaderProps {
    label: string;
}

export const Header = ({
    label,
}: HeaderProps) =>{
    return (
        <div className="w-full flex flex-col gap-y-4 items-center justify-center">
         <h1 className={cn(
            "text-3xl font-semibold text-[var(--theme-primary)]", font.className
         )}>
          truevenix
         </h1> 
         <p className="text-[#6b7280] text-sm">
            {label}
         </p>
        </div>
    )
}