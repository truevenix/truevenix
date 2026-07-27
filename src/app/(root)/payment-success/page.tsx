import PaymentSuccessClient from "./_components/PamentSuccessClient"

 interface Props {
  searchParams: Promise<{
    reference?: string
    orderId?: string
  }>
}

export default async function Page({ searchParams }: Props) {
  const { reference = null, orderId = null } = await searchParams

  return (
    <PaymentSuccessClient
      reference={reference}
      orderId={orderId}
    />
  )
}