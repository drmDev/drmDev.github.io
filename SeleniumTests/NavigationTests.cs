using FluentAssertions;
using OpenQA.Selenium;
using SeleniumExtras.WaitHelpers;

namespace SeleniumTests
{
    public class NavigationTests : BaseTest
    {
        [Test]
        public void HobbiesPage_ShouldRender()
        {
            // Navigate to the landing page
            driver.Navigate().GoToUrl("https://drmdev.github.io/");

            // Click on the "Hobbies" navbar link
            var hobbiesLink = wait.Until(ExpectedConditions.ElementToBeClickable(By.Id("nav-hobbies")));
            hobbiesLink.Click();

            // Verify the filter section is visible
            var filterSection = wait.Until(ExpectedConditions.ElementIsVisible(By.Id("filter-board-games")));
            filterSection.Displayed.Should().BeTrue("The filter section should be visible on the Hobbies page.");
        }
    }
}
