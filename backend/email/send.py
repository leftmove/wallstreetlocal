import os
from dotenv import load_dotenv

import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

load_dotenv()

source = os.environ.get("EMAIL_ADDRESS", None)
password = os.environ.get("EMAIL_PASSWORD", None)

mail_service = "smtp.gmail.com"
mail_port = 465
server = smtplib.SMTP_SSL(mail_service, mail_port)
server.login(source, password)


def email_holding(subject, body, to):

    msg = MIMEMultipart()
    text = MIMEText(body)

    msg["Subject"] = subject
    msg["From"] = source
    msg["To"] = to
    msg.attach(body)

    server.sendmail(source, to, msg.as_string())
