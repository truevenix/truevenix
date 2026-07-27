import { CheckCircle } from "lucide-react";

interface FormSuccessProps {
  message?: string;
  className?: string;
}

export const FormSuccess = ({ message, className }: FormSuccessProps) => {
  if (!message) return null;

  return (
    <div
      className={`bg-emerald-500/15 p-3 rounded-md flex items-center gap-x-4 text-sm text-emerald-500 ${className ?? ""}`}
    >
      <CheckCircle className="h-4 w-4" />
      <p>{message}</p>
    </div>
  );
};
