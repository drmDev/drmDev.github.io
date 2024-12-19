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

            // Wait for the Minimum Players filter to be visible
            var minPlayersFilter = wait.Until(ExpectedConditions.ElementIsVisible(By.Id("min-players")));
            var maxPlayersFilter = wait.Until(ExpectedConditions.ElementIsVisible(By.Id("max-players")));

            // Verify filters are displayed
            minPlayersFilter.Displayed.Should().BeTrue("Minimum Players filter is not visible.");
            maxPlayersFilter.Displayed.Should().BeTrue("Maximum Players filter is not visible.");
        }
    }
}
