export const NIC_MAX_LENGTH = 20;

export function limitNic(value = "") {
  return value.slice(0, NIC_MAX_LENGTH);
}

export function assertValidNic(value = "") {
  if (value.length > NIC_MAX_LENGTH) {
    throw new Error(`NIC / Passport number cannot exceed ${NIC_MAX_LENGTH} characters.`);
  }
}
