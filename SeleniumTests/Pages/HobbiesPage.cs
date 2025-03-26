using OpenQA.Selenium;
using SeleniumExtras.WaitHelpers;

namespace SeleniumTests.Pages
{
    public class HobbiesPage : BasePage
    {
        private readonly By FilterBoardGames = By.Id("filter-board-games");

        public HobbiesPage(IWebDriver driver) : base(driver) 
        {
            // verify we're on the hobbies page first
            Wait.Until(ExpectedConditions.ElementIsVisible(FilterBoardGames));
        }

        public bool IsFilterSectionDisplayed()
        {
            var filterSection = Wait.Until(ExpectedConditions.ElementIsVisible(FilterBoardGames));
            return filterSection.Displayed;
        }
    }
}
