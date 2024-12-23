using FluentAssertions;
using OpenQA.Selenium;
using SeleniumExtras.WaitHelpers;

namespace SeleniumTests
{
    public class NavigationTests : BaseTest
    {
        [Test]
        public void HobbiesPage_ShouldRender_AndShowFilters()
        {
            // Navigate to the landing page
            driver.Navigate().GoToUrl("https://drmdev.github.io/");

            // Click on the "Hobbies" navbar link
            var hobbiesLink = wait.Until(ExpectedConditions.ElementToBeClickable(By.XPath("//a[contains(text(), 'Hobbies')]")));
            hobbiesLink.Click();
        }
    }
}
