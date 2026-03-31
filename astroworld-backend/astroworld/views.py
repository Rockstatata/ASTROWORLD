from django.http import HttpResponse

def homepage(request):
    return HttpResponse("Welcome to the Astroworld Homepage!")


def healthz(request):
    return HttpResponse("ok")
