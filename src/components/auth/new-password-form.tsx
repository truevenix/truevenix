'use client'
import { CardWrapper } from "@/components/auth/card-wrapper"
import * as z from "zod"
import { NewPasswordSchema } from "@/schemas"
import { useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FormError } from "@/components/forms/form-error"
import { FormSuccess } from "@/components/forms/form-success"
import { newPassword } from "@/actions/auth/new-password"
import { useState, useTransition } from "react"



export const NewPasswordForm = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  
    const form = useForm<z.infer<typeof NewPasswordSchema>>({
        resolver: zodResolver(NewPasswordSchema), 
        defaultValues: {
            password: "",
        },
    });
    
  const onSubmit = (values: z.infer<typeof NewPasswordSchema>) => {
    setError("");
    setSuccess("");
    startTransition(() => {
      newPassword(values, token)
      .then((data) => {
        setError(data?.error);
        setSuccess(data?.success)
      })
    })
   
  }

    return (
        <CardWrapper 
        headerLabel="Enter a new password?"
        backButtonLabel="Back to login"
        backButtonHref="/auth/login" 
        >
            <Form{...form}>
              <form className="space-y-6"
               onSubmit={form.handleSubmit(onSubmit)}>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({field}) => (
                       <FormItem>
                         <FormLabel>Password</FormLabel>
                         <FormControl>
                            <Input {...field}
                             disabled={isPending}
                             placeholder="******"
                             type="password"
                            />
                         </FormControl>
                         <FormMessage/>
                       </FormItem> 
                    )}
                  />
                 
                </div>
                <FormError message={error}/>
                <FormSuccess message={success}/>
                <Button type="submit" disabled={isPending} className="w-full">
                  Reset password
                </Button>
              </form>
            </Form>
        </CardWrapper>
    )
}