export const shortenAddress = (
  address: string,
  firstPartLength: number = 4,
  secondPartLength: number = 4,
): string => {
  if (!address || address?.length <= firstPartLength + secondPartLength) {
    return address
  }
  return `${address.slice(0, firstPartLength)}...${address.slice(-secondPartLength)}`
}
