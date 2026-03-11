const EMAIL_MAX_LENGTH = 254;
const LOCAL_PART_MAX_LENGTH = 64;
const DOMAIN_MAX_LENGTH = 253;
const LOCAL_PART_PATTERN =
  /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*$/i;
const DOMAIN_LABEL_PATTERN = /^(?!-)[a-z0-9-]{1,63}(?<!-)$/i;

export function normalizeEmail(input: string) {
  return input.trim().toLowerCase();
}

export function isValidEmailAddress(input: string) {
  const email = normalizeEmail(input);

  if (!email || email.length > EMAIL_MAX_LENGTH || /\s/.test(email)) {
    return false;
  }

  const parts = email.split("@");

  if (parts.length !== 2) {
    return false;
  }

  const [localPart, domain] = parts;

  if (
    !localPart ||
    !domain ||
    localPart.length > LOCAL_PART_MAX_LENGTH ||
    domain.length > DOMAIN_MAX_LENGTH
  ) {
    return false;
  }

  if (!LOCAL_PART_PATTERN.test(localPart)) {
    return false;
  }

  const labels = domain.split(".");

  if (labels.length < 2) {
    return false;
  }

  if (labels.some((label) => !DOMAIN_LABEL_PATTERN.test(label))) {
    return false;
  }

  const topLevelDomain = labels[labels.length - 1];

  if (!/^[a-z]{2,63}$/i.test(topLevelDomain)) {
    return false;
  }

  return true;
}
