export type PasswordRequirementId =
  | "length"
  | "uppercase"
  | "lowercase"
  | "number"
  | "special";

export type PasswordRequirement = {
  id: PasswordRequirementId;
  label: string;
  test: (password: string) => boolean;
};

export const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  {
    id: "length",
    label: "8+ characters",
    test: (password) => password.length >= 8,
  },
  {
    id: "uppercase",
    label: "Uppercase letter",
    test: (password) => /[A-Z]/.test(password),
  },
  {
    id: "lowercase",
    label: "Lowercase letter",
    test: (password) => /[a-z]/.test(password),
  },
  {
    id: "number",
    label: "Number",
    test: (password) => /[0-9]/.test(password),
  },
  {
    id: "special",
    label: "Special character",
    test: (password) =>
      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password),
  },
];

const BLOCKED_PASSWORDS = new Set(
  [
    "password",
    "password123",
    "charid123",
    "abc12345",
    "12345678",
    "qwerty123",
  ].map((value) => value.toLowerCase())
);

export type PasswordValidationResult = {
  valid: boolean;
  checks: Record<PasswordRequirementId, boolean>;
  failedLabels: string[];
};

export function checkPasswordRequirements(
  password: string
): Record<PasswordRequirementId, boolean> {
  return PASSWORD_REQUIREMENTS.reduce(
    (checks, requirement) => {
      checks[requirement.id] = requirement.test(password);
      return checks;
    },
    {} as Record<PasswordRequirementId, boolean>
  );
}

export function validatePassword(password: string): PasswordValidationResult {
  const checks = checkPasswordRequirements(password);
  const failedLabels = PASSWORD_REQUIREMENTS.filter(
    (requirement) => !checks[requirement.id]
  ).map((requirement) => requirement.label);

  const valid =
    failedLabels.length === 0 && !BLOCKED_PASSWORDS.has(password.toLowerCase());

  if (valid) {
    return { valid: true, checks, failedLabels: [] };
  }

  if (
    failedLabels.length === 0 &&
    BLOCKED_PASSWORDS.has(password.toLowerCase())
  ) {
    return {
      valid: false,
      checks,
      failedLabels: ["a stronger, less common password"],
    };
  }

  return { valid, checks, failedLabels };
}

export function formatPasswordValidationError(
  result: PasswordValidationResult
): string {
  if (result.valid) {
    return "";
  }

  const lines = result.failedLabels.map((label) => `• ${label}`);
  return `Password must contain:\n${lines.join("\n")}`;
}
