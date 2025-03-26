using OpenQA.Selenium;
using SeleniumExtras.WaitHelpers;

namespace SeleniumTests.Pages
{
    public class HomePage : BasePage
    {
        private readonly By ResumeLink = By.Id("resume-download-link");
        private readonly By ResumeViewer = By.Id("resume-viewer");

        public HomePage(IWebDriver driver) : base(driver) { }

        // fluent method for chaining
        public HomePage NavigateToHomePage(string baseUrl)
        {
            Driver.Navigate().GoToUrl(baseUrl);
            return this;
        }

        public bool IsResumeLinkDisplayed()
        {
            var resumeLink = Wait.Until(ExpectedConditions.ElementIsVisible(ResumeLink));
            return resumeLink.Displayed;
        }

        public bool IsResumeViewerDisplayed()
        {
            var resumeViewer = Wait.Until(ExpectedConditions.ElementIsVisible(ResumeViewer));
            return resumeViewer.Displayed;
        }

        public HobbiesPage NavigateToHobbies()
        {
            var hobbiesLink = Wait.Until(ExpectedConditions.ElementToBeClickable(NavHobbiesLink));
            hobbiesLink.Click();
            return new HobbiesPage(Driver);
        }
    }
}
