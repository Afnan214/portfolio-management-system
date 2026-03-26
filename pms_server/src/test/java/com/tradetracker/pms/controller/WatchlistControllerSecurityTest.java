package com.tradetracker.pms.controller;

import com.tradetracker.pms.entity.User;
import com.tradetracker.pms.entity.Watchlist;
import com.tradetracker.pms.repository.UserRepository;
import com.tradetracker.pms.repository.WatchlistRepository;
import com.tradetracker.pms.security.JwtService;
import com.tradetracker.pms.service.stock.FinnhubPollingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import jakarta.servlet.http.Cookie;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:watchlisttest;MODE=MySQL;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
    "spring.datasource.driverClassName=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.jpa.show-sql=false",
    "spring.sql.init.mode=never",
    "finnhub.api.key=test-key",
    "app.jwt.secret=MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=",
    "app.jwt.expiration-ms=86400000"
})
@AutoConfigureMockMvc
class WatchlistControllerSecurityTest {

  private static final String EMAIL = "investor@example.com";

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private JwtService jwtService;

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private WatchlistRepository watchlistRepository;

  @Autowired
  private PasswordEncoder passwordEncoder;

  @MockitoBean
  private FinnhubPollingService finnhubPollingService;

  private User user;

  @BeforeEach
  void setUp() {
    watchlistRepository.deleteAll();
    userRepository.deleteAll();

    user = new User();
    user.setFirstName("Casey");
    user.setLastName("Investor");
    user.setEmail(EMAIL);
    user.setPasswordHash(passwordEncoder.encode("secret123"));
    user.setEnabled(true);
    user = userRepository.save(user);
  }

  @Test
  void getWatchlistsWithValidAccessTokenReturnsOk() throws Exception {
    Watchlist watchlist = saveWatchlist("Core Ideas", true);

    mockMvc.perform(get("/api/watchlists")
            .cookie(accessTokenCookie())
            .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].id").value(watchlist.getId()))
        .andExpect(jsonPath("$[0].name").value("Core Ideas"))
        .andExpect(jsonPath("$[0].default").value(true));
  }

  @Test
  void getDefaultWatchlistWithValidAccessTokenReturnsOk() throws Exception {
    Watchlist watchlist = saveWatchlist("Default Watchlist", true);

    mockMvc.perform(get("/api/watchlists/default")
            .cookie(accessTokenCookie())
            .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(watchlist.getId()))
        .andExpect(jsonPath("$.name").value("Default Watchlist"))
        .andExpect(jsonPath("$.default").value(true));
  }

  @Test
  void getWatchlistByIdWithValidAccessTokenReturnsOk() throws Exception {
    Watchlist watchlist = saveWatchlist("Growth", false);

    mockMvc.perform(get("/api/watchlists/{id}", watchlist.getId())
            .cookie(accessTokenCookie())
            .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(watchlist.getId()))
        .andExpect(jsonPath("$.name").value("Growth"))
        .andExpect(jsonPath("$.default").value(false));
  }

  @ParameterizedTest
  @ValueSource(strings = {
      "/api/watchlists",
      "/api/watchlists/default",
      "/api/watchlists/42"
  })
  void protectedWatchlistRoutesRejectUnauthenticatedRequests(String path) throws Exception {
    mockMvc.perform(get(path).accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void missingDefaultWatchlistReturnsNotFound() throws Exception {
    saveWatchlist("Ideas", false);

    mockMvc.perform(get("/api/watchlists/default")
            .cookie(accessTokenCookie())
            .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.message").value("Default watchlist not found"));
  }

  @Test
  void missingWatchlistByIdReturnsNotFoundMessage() throws Exception {
    mockMvc.perform(get("/api/watchlists/{id}", 9999L)
            .cookie(accessTokenCookie())
            .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.message").value("Watchlist not found"));
  }

  private Cookie accessTokenCookie() {
    return new Cookie("access_token", jwtService.generateToken(user));
  }

  private Watchlist saveWatchlist(String name, boolean isDefault) {
    Watchlist watchlist = new Watchlist();
    watchlist.setUser(user);
    watchlist.setName(name);
    watchlist.setDescription("Demo watchlist");
    watchlist.setDefault(isDefault);
    return watchlistRepository.save(watchlist);
  }
}
