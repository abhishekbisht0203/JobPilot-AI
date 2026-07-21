from ...core.config import settings
import uuid

def generate_tracking_id() -> str:
    return str(uuid.uuid4())

async def send_email(to_email: str, subject: str, body: str, tracking_id: str) -> bool:
    if not settings.SENDGRID_API_KEY:
        print(f"[EMAIL SIMULATED] To: {to_email}, Subject: {subject}")
        return True
    
    try:
        from sendgrid import SendGridAPIClient
        from sendgrid.helpers.mail import Mail, Email, Content, TrackingSettings, OpenTracking
        
        message = Mail(
            from_email=Email(settings.FROM_EMAIL, "JobPilot AI"),
            to_email=to_email,
            subject=subject,
        )
        
        tracking_pixel = f'<img src="{settings.API_PREFIX}/webhooks/email-open/{tracking_id}" width="1" height="1" />'
        message.add_content(Content("text/html", body + tracking_pixel))
        
        tracking_settings = TrackingSettings()
        open_tracking = OpenTracking(enable=True, substitution_tag="%open_track%")
        tracking_settings.open_tracking = open_tracking
        message.tracking_settings = tracking_settings
        
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        response = sg.send(message)
        return response.status_code in (200, 201, 202)
    except Exception as e:
        print(f"SendGrid error: {e}")
        return False
