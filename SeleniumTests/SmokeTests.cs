using FluentAssertions;
using OpenQA.Selenium;
using SeleniumExtras.WaitHelpers;

namespace SeleniumTests
{
    public class SmokeTests : BaseTest
    {
        [Test]
        public void LandingPage_ShouldRender_AndShowResumeLink()
        {
            // Navigate to the landing page
            driver.Navigate().GoToUrl("https://drmdev.github.io/");

            // Wait until the resume link is visible
            var resumeLink = wait.Until(ExpectedConditions.ElementIsVisible(By.XPath("//a[contains(@href, '/assets/pdf/DM_Resume_2024.pdf')]")));

            // Verify the resume link is displayed
            resumeLink.Displayed.Should().BeTrue("Resume link is not visible on the landing page.");
        }
    }
}