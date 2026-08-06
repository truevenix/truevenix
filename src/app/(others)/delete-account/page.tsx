"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { AlertTriangle, Loader2, ShieldAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useCurrentUser } from "@/hooks/use-current-user"

const deleteAccountFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  reason: z.string().min(10, "Please provide a reason (at least 10 characters)"),
  urgency: z.enum(["low", "medium", "high"]),
  additionalInfo: z.string().optional(),
})

type DeleteAccountFormValues = z.infer<typeof deleteAccountFormSchema>

async function submitDeletionRequest(data: DeleteAccountFormValues) {
  const response = await fetch("/api/account/delete-request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })

  const result = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(result?.error || `Failed to submit request: ${response.statusText}`)
  }

  return result
}

export default function DeleteAccountPage() {
  const router = useRouter()
  const currentUser = useCurrentUser()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const form = useForm<DeleteAccountFormValues>({
    resolver: zodResolver(deleteAccountFormSchema),
    defaultValues: {
      email: currentUser?.email ?? "",
      reason: "",
      urgency: "medium",
      additionalInfo: "",
    },
  })

  async function onSubmit(data: DeleteAccountFormValues) {
    setIsSubmitting(true)
    try {
      const result = await submitDeletionRequest(data)

      if (!result.success) throw new Error(result.error || "Failed to submit deletion request")

      toast.success("Account deletion request submitted successfully!", {
        description:
          "Our team will process your request within 24 hours and contact you at the provided email address.",
        duration: 5000,
      })

      setSubmitted(true)
      form.reset()

      setTimeout(() => router.push("/"), 3000)
    } catch (error) {
      console.error("Error submitting deletion request:", error)

      if (error instanceof TypeError && error.message.includes("fetch")) {
        toast.error("Network error", {
          description: "Unable to connect to the server. Please check your internet connection and try again.",
          duration: 5000,
        })
      } else {
        toast.error("Failed to submit deletion request", {
          description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
          duration: 5000,
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="border-red-100">
          <CardHeader>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                <ShieldAlert className="w-[18px] h-[18px] text-red-500" />
              </div>
              <CardTitle className="text-2xl font-black text-red-600">
                Request Account Deletion
              </CardTitle>
            </div>
            <CardDescription>
              Submit this form to request permanent deletion of your Truevenix account and all
              associated data. This action cannot be undone.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {submitted ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center">
                  <ShieldAlert className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="font-bold text-gray-900">Request submitted</p>
                <p className="text-sm text-gray-500 max-w-sm">
                  Our team will reach out to the email you provided within 24 hours to confirm
                  and process this request. Redirecting you home…
                </p>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-600">Email Address *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your account email address"
                            className="text-gray-700"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormDescription>
                          This must match the email address associated with your account.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-600">Reason for Deletion *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Please explain why you want to delete your account..."
                            className="min-h-[100px] text-gray-700"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormDescription>
                          Help us understand your reason for leaving. Your feedback is valuable to us.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="urgency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-600">Urgency Level</FormLabel>
                        <FormControl>
                          {/* No radix-select is installed in this project — a native
                              select styled to match Input keeps this dependency-free. */}
                          <select
                            {...field}
                            disabled={isSubmitting}
                            className="flex h-11 w-full rounded-xl border-2 border-input bg-white px-4 py-2 text-gray-800 text-sm ring-offset-background focus-visible:outline-none focus-visible:border-[var(--theme-primary)] focus-visible:ring-2 focus-visible:ring-[var(--theme-primary-light)] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                          >
                            <option value="low">Low - Process within 7 days</option>
                            <option value="medium">Medium - Process within 3 days</option>
                            <option value="high">High - Process within 24 hours</option>
                          </select>
                        </FormControl>
                        <FormDescription>
                          How urgently do you need your account deleted?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="additionalInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-600">Additional Information</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any additional information we should know..."
                            className="min-h-[80px] text-gray-700"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormDescription>
                          Include any specific details about data you want deleted or special circumstances.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="p-4 border border-red-200 bg-red-50 rounded-xl">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-red-600">
                          Warning: Account deletion is permanent
                        </p>
                        <p className="text-sm text-red-500/90 mt-1">
                          All your data — including orders, addresses, saved items, and history —
                          will be permanently removed and cannot be recovered.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting Request...
                        </>
                      ) : (
                        "Submit Deletion Request"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            {!submitted && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 mb-2">What happens next?</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Our team will review your request within 24 hours</li>
                  <li>• We may contact you to confirm your identity</li>
                  <li>• All your data will be permanently deleted</li>
                  <li>• You will receive a confirmation email once completed</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}