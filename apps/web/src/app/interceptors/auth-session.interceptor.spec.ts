import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from "@angular/common/http";
import {
  provideHttpClientTesting,
  HttpTestingController,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { AuthService } from "../services-api/auth.service";
import { authSessionInterceptor } from "./auth-session.interceptor";

describe("authSessionInterceptor", () => {
  const router = {
    navigateByUrl: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Router, useValue: router },
        provideHttpClient(withInterceptors([authSessionInterceptor])),
        provideHttpClientTesting(),
      ],
    });
  });

  it("refreshes the session and retries when a protected request returns 401", (done) => {
    const http = TestBed.inject(HttpClient);
    const httpTestingController = TestBed.inject(HttpTestingController);

    http.get("/orders").subscribe((orders) => {
      expect(orders).toEqual([{ id: "order_1" }]);
      expect(router.navigateByUrl).not.toHaveBeenCalled();
      done();
    });

    httpTestingController
      .expectOne("/orders")
      .flush({}, { status: 401, statusText: "Unauthorized" });
    httpTestingController.expectOne("http://localhost:3000/auth/refresh").flush({
      user: {
        id: "user_1",
        companyId: "company_1",
        name: "Ana Admin",
        email: "ana@acme.test",
        role: "ADMIN",
        isActive: true,
      },
      company: {
        id: "company_1",
        name: "Acme",
      },
    });
    httpTestingController.expectOne("/orders").flush([{ id: "order_1" }]);
  });

  it("clears session and redirects to login when refresh fails", (done) => {
    const http = TestBed.inject(HttpClient);
    const httpTestingController = TestBed.inject(HttpTestingController);
    const authService = TestBed.inject(AuthService);
    const sessions: unknown[] = [];

    authService.session$.subscribe((session) => sessions.push(session));

    http.get("/orders").subscribe({
      error: (error: unknown) => {
        expect(error).toBeInstanceOf(HttpErrorResponse);
        expect(router.navigateByUrl).toHaveBeenCalledWith("/login");
        expect(sessions.at(-1)).toBeNull();
        done();
      },
    });

    httpTestingController
      .expectOne("/orders")
      .flush({}, { status: 401, statusText: "Unauthorized" });
    httpTestingController
      .expectOne("http://localhost:3000/auth/refresh")
      .flush({}, { status: 401, statusText: "Unauthorized" });
  });

  it("does not redirect when the public session check returns 401", (done) => {
    const http = TestBed.inject(HttpClient);
    const httpTestingController = TestBed.inject(HttpTestingController);

    http.get("http://localhost:3000/auth/session").subscribe({
      error: () => {
        expect(router.navigateByUrl).not.toHaveBeenCalled();
        done();
      },
    });

    httpTestingController
      .expectOne("http://localhost:3000/auth/session")
      .flush({}, { status: 401, statusText: "Unauthorized" });
  });
});
