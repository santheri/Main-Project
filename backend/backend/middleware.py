from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin


class RestrictDomainAccessMiddleware(MiddlewareMixin):
    ALLOWED_DOMAINS = []

    # add your allowed domains here
    def process_request(self, request):
        referer = request.META.get("HTTP_REFERER")
        origin = request.META.get("HTTP_ORIGIN")

        allowed = False

        if referer:
            allowed = any(domain in referer for domain in self.ALLOWED_DOMAINS)
        if origin:
            allowed = allowed or any(
                domain in origin for domain in self.ALLOWED_DOMAINS
            )

        # if not allowed:
        #     return JsonResponse({"error": "Access denied"}, status=403)
