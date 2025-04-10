from django.db import models
from django.db.models.signals import m2m_changed
from django.dispatch import receiver


class Student(models.Model):
    S_id = models.AutoField(primary_key=True)
    S_name = models.CharField(max_length=255, null=True, blank=True)
    S_email = models.EmailField(unique=True)
    S_phone = models.CharField(max_length=20,  null=True)
    created_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return str(self.S_id)


class TestCase(models.Model):
    input = models.TextField()
    output = models.TextField()
    isPublic = models.BooleanField(default=False)

    def __str__(self):
        return self.input


class Exam(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(null=True, blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    students = models.ManyToManyField(Student, related_name='exams', null=True)
    num_of_questions = models.IntegerField()
    total_marks = models.IntegerField()
    duration = models.IntegerField(default=300)
    difficulty = models.TextField(null=True, blank=True)
    rules = models.CharField(default='''Login and start the exam on schedule. Late submissions are not allowed.
                        Ensure reliable internet to avoid disruptions.
                        Work individually; malpractice leads to disqualification.
                        Submit answers before the timer ends. Save coding answers properly.
                        Only use tools provided within the exam. External help is not allowed.
                         Use "Next" and "Previous" buttons to move between questions.
                        Double-check answers before final submission.
                        Contact support immediately if needed.
                                ''', max_length=30000)
    status = models.CharField(default='open', max_length=500)
    no_of_students_attended = models.IntegerField(default=0)
    plagiarism_checked = models.BooleanField(default=False)

    def __str__(self) -> str:
        return self.name


@receiver(m2m_changed, sender=Exam.students.through)
def update_students_attended(sender, instance, action, **kwargs):
    if action == "post_add":
        instance.no_of_students_attended = instance.students.count()
        instance.save(update_fields=['no_of_students_attended'])


class Question(models.Model):
    exam = models.ForeignKey(
        Exam, on_delete=models.CASCADE, related_name='questions')
    title = models.TextField(default="Question", max_length=3000)
    question_text = models.TextField()
    input_constrains = models.TextField(null=True)
    input_format = models.TextField(null=True)
    difficulty = models.TextField(null=True)
    expected_output = models.TextField(null=True)
    marks = models.IntegerField()
    testCases = models.ManyToManyField(
        TestCase, related_name='questions_test_case')

    def __str__(self) -> str:
        return self.title


class Submission(models.Model):
    question = models.ForeignKey(
        Question, on_delete=models.CASCADE,  related_name='question_submission')
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name='submissions')
    no_of_test_cases_passed = models.IntegerField(default=0)
    submitted_at = models.DateTimeField(auto_now_add=True)
    answers = models.TextField()
    status = models.TextField(default="submitted")


class Result(models.Model):
    exam = models.ForeignKey(
        Exam, on_delete=models.CASCADE, null=True, related_name='results_exam')
    question = models.ForeignKey(
        Question, on_delete=models.CASCADE, related_name='results_question')
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name='results')
    submission = models.ForeignKey(
        Submission, on_delete=models.CASCADE, related_name='student_submission', null=True
    )
    marks_obtained = models.IntegerField()
    published_at = models.DateTimeField(auto_now_add=True)
    plagiarism_percentage = models.IntegerField(default=0)


class CompletedExams(models.Model):
    exam = models.ForeignKey(
        Exam, on_delete=models.CASCADE, related_name='exam_completed')
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name='exam_compl')
    submission = models.ForeignKey(
        Submission, on_delete=models.CASCADE, related_name='exam_submission', null=True
    )
    submitted_time = models.DateTimeField(auto_now=True)
