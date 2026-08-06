"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { AlertTriangle, Loader2, ShieldAlert, Database, Trash2 } from "lucide-react"

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
  requestType: z.enum(["full_deletion", "partial_deletion"]),
  dataToDelete: z.string().optional(),
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
  const [requestType, setRequestType] = useState<"full_deletion" | "partial_deletion">("full_deletion")

  const form = useForm<DeleteAccountFormValues>({
    resolver: zodResolver(deleteAccountFormSchema),
    defaultValues: {
      email: currentUser?.email ?? "",
      requestType: "full_deletion",
      dataToDelete: "",
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

      const message = data.requestType === "full_deletion" 
        ? "Account deletion request submitted successfully!"
        : "Data deletion request submitted successfully!"

      const description = data.requestType === "full_deletion"
        ? "Our team will process your request within 24 hours and contact you at the provided email address."
        : "Our team will review and process your data deletion request within 48 hours."

      toast.success(message, {
        description,
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
                Request Data Deletion
              </CardTitle>
            </div>
            <CardDescription>
              Choose to permanently delete your entire account or select specific data to delete 
              while keeping your account active.
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
                    name="requestType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-600">Request Type *</FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button
                              type="button"
                              className={`p-4 rounded-xl border-2 text-left transition-all ${
                                field.value === "full_deletion"
                                  ? "border-red-500 bg-red-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                              onClick={() => {
                                field.onChange("full_deletion")
                                setRequestType("full_deletion")
                              }}
                              disabled={isSubmitting}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${
                                  field.value === "full_deletion" ? "bg-red-100" : "bg-gray-100"
                                }`}>
                                  <Trash2 className={`w-4 h-4 ${
                                    field.value === "full_deletion" ? "text-red-600" : "text-gray-500"
                                  }`} />
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">Delete Entire Account</p>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    Permanently delete account and all associated data
                                  </p>
                                </div>
                              </div>
                            </button>
                            <button
                              type="button"
                              className={`p-4 rounded-xl border-2 text-left transition-all ${
                                field.value === "partial_deletion"
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                              onClick={() => {
                                field.onChange("partial_deletion")
                                setRequestType("partial_deletion")
                              }}
                              disabled={isSubmitting}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${
                                  field.value === "partial_deletion" ? "bg-blue-100" : "bg-gray-100"
                                }`}>
                                  <Database className={`w-4 h-4 ${
                                    field.value === "partial_deletion" ? "text-blue-600" : "text-gray-500"
                                  }`} />
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">Delete Specific Data</p>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    Keep account, delete specific types of data
                                  </p>
                                </div>
                              </div>
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {requestType === "partial_deletion" && (
                    <FormField
                      control={form.control}
                      name="dataToDelete"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-600">What Data Do You Want Deleted? *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Please list the specific data you want deleted (e.g., order history, saved addresses, payment methods, profile information, etc.)"
                              className="min-h-[100px] text-gray-700"
                              {...field}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormDescription>
                            Be specific about which data you want permanently removed from your account.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-600">
                          {requestType === "full_deletion" ? "Reason for Deletion" : "Reason for Data Deletion"} *
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={requestType === "full_deletion" 
                              ? "Please explain why you want to delete your account..." 
                              : "Please explain why you want to delete this data..."
                            }
                            className="min-h-[100px] text-gray-700"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormDescription>
                          Help us understand your reason. Your feedback is valuable to us.
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
                          How urgently do you need this processed?
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
                          Include any special circumstances or details about your request.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {requestType === "full_deletion" && (
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
                  )}

                  {requestType === "partial_deletion" && (
                    <div className="p-4 border border-blue-200 bg-blue-50 rounded-xl">
                      <div className="flex items-start gap-2.5">
                        <Database className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-blue-600">
                            Data Deletion Information
                          </p>
                          <p className="text-sm text-blue-500/90 mt-1">
                            Only the specified data will be permanently deleted. Your account 
                            and other data will remain active. This action cannot be undone.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

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
                      className={`flex-1 ${
                        requestType === "full_deletion" 
                          ? "bg-red-600 hover:bg-red-700" 
                          : "bg-blue-600 hover:bg-blue-700"
                      } text-white`}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting Request...
                        </>
                      ) : (
                        requestType === "full_deletion" 
                          ? "Submit Deletion Request" 
                          : "Submit Data Deletion Request"
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
                  <li>• Our team will review your request within 24-48 hours</li>
                  <li>• We may contact you to confirm your identity</li>
                  <li>• Your requested data will be permanently deleted</li>
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