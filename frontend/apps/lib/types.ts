export type TokenPair = { access_token: string; refresh_token: string; token_type: string; };
export type Workspace = { id: string; name: string; plan: string; role: string | null; };
export type Project = { id: string; title: string; workspace_id: string; };
export type Billing = { plan: string; seats: number; checkout_url: string; };
export type AuditEntry = { id: string; action: string; detail: string; actor_id: string; };
