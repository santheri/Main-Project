from django.contrib import admin
from .models import *
# Register your models here.
admin.site.register(Student)
admin.site.register(Exam)
admin.site.register(Submission)
admin.site.register(Question)
admin.site.register(CompletedExams)
admin.site.register(Result)
admin.site.register(TestCase)
