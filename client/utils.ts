export const formatPrice = (price: number) => {
  const priceString = price.toString()
  let result = '€'
  for (let i = 0; i < priceString.length; i++) {
    result =
      (i % 3 == 2 ? ' ' : '') + priceString[priceString.length - i - 1] + result
  }

  return result.trim()
}
