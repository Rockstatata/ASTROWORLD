from django.http import HttpResponse

def homepage(request):
    return HttpResponse("Welcome to the Astroworld Homepage!")

def about(request):
    return HttpResponse("This is the About page.")