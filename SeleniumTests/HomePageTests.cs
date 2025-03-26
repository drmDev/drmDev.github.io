using FluentAssertions;
using SeleniumTests.Pages;

namespace SeleniumTests
{
    [Category("HomePage")]
    public class HomePageTests : BaseTest
    {
        private HomePage _homePage;

        [SetUp]
        public void Setup()
        {
            base.SetUp();
            _homePage = new HomePage(driver);
        }

        [Test]
        [TestCase("chrome", TestName = "LandingPage_ShouldRender_AndShowResumeLink_Chrome")]
        [TestCase("firefox", TestName = "LandingPage_ShouldRender_AndShowResumeLink_Firefox")]
        [TestCase("edge", TestName = "LandingPage_ShouldRender_AndShowResumeLink_Edge")]
        public void LandingPage_ShouldRender_AndShowResume(string browser)
        {
            // Override browser setting from test parameter to force allowing all browsers
            Environment.SetEnvironmentVariable("TEST_BROWSER", browser);

            _homePage.NavigateToHomePage(BASE_URL);

            _homePage.IsResumeLinkDisplayed()
                .Should().BeTrue("Resume link should be visible on the landing page");
            _homePage.IsResumeViewerDisplayed()
                .Should().BeTrue("Resume viewer is not visible on the landing page.");
        }
    }
}