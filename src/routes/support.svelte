<script>
    const supportEmail = "support@yourdomain.com";
    const privacyLink = "https://canteen.icimod.org/privacypolicy/index.html";
    const googleFormUrl = "https://forms.gle/eX9aFsLqJjVMUHM4A";
  </script>
  
  <style>
    .container {
      max-width: 700px;
      margin: 2rem auto;
      padding: 1rem;
      font-family: Arial, sans-serif;
      background-color: #f9f9f9;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    h1 {
      color: #0066cc;
      font-size: 2rem;
      margin-bottom: 1rem;
    }
    a {
      color: #0066cc;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    .section {
      margin-bottom: 1.5rem;
    }
    iframe {
      width: 100%;
      height: 800px;
      border: none;
      border-radius: 8px;
    }
  </style>
  
  <div class="container">
    <h1>Support</h1>
  
    <div class="section">
      <p>Thank you for using <strong>Your App Name</strong>. If you have any issues or suggestions, feel free to reach out using the form below or the contact options provided.</p>
    </div>
  
    <div class="section">
      <p><strong>Email:</strong> <a href={`mailto:${supportEmail}`}>{supportEmail}</a></p>
      <p><strong>FAQs:</strong> <a href={faqLink} target="_blank">{faqLink}</a></p>
      <p><strong>Privacy Policy:</strong> <a href={privacyLink} target="_blank">{privacyLink}</a></p>
    </div>
  
    <div class="section">
      <h2>Submit a Support Request</h2>
      <iframe src={googleFormUrl}></iframe>
    </div>
  
    <p>We usually respond within 24–48 hours. Thanks for your patience!</p>
  </div>