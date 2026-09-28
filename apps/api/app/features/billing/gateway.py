class BillingGateway:
    def checkout_url(self, workspace_id: str, plan: str) -> str:
        return f"https://billing.example.test/checkout/{workspace_id}/{plan}"
