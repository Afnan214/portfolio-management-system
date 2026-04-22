import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, of } from 'rxjs';
import { vi } from 'vitest';

import {
  CreateWatchlistRequest,
  UpdateWatchlistRequest,
  WatchlistService,
} from './watchlist-service';

describe('WatchlistService', () => {
  const apiUrl = 'http://localhost:8080/api/watchlists';

  let service: WatchlistService;
  let httpClient: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  const buildApiWatchlist = (overrides: Partial<Record<string, unknown>> = {}) => ({
    id: 1,
    userId: 1,
    name: 'My Watchlist',
    description: 'Core holdings',
    isDefault: true,
    stockIds: [1, 2],
    createdAt: '2026-03-24T10:00:00Z',
    updatedAt: '2026-03-24T12:00:00Z',
    ...overrides,
  });

  const normalizeWatchlist = (watchlist: ReturnType<typeof buildApiWatchlist>) => ({
    ...watchlist,
    createdAt: new Date(String(watchlist.createdAt)),
    updatedAt: new Date(String(watchlist.updatedAt)),
  });

  beforeEach(() => {
    httpClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        WatchlistService,
        {
          provide: HttpClient,
          useValue: httpClient,
        },
      ],
    });

    service = TestBed.inject(WatchlistService);
  });

  it('should get all watchlists from the watchlist endpoint', async () => {
    const apiResponse = [
      buildApiWatchlist(),
      buildApiWatchlist({
        id: 2,
        name: 'Growth',
        isDefault: false,
        stockIds: [3],
      }),
    ];
    httpClient.get.mockReturnValue(of(apiResponse));

    await expect(firstValueFrom(service.getWatchlists())).resolves.toEqual(
      apiResponse.map((watchlist) => normalizeWatchlist(watchlist)),
    );
    expect(httpClient.get).toHaveBeenCalledWith(apiUrl);
  });

  it('should get the default watchlist from the default endpoint', async () => {
    const apiResponse = buildApiWatchlist();
    httpClient.get.mockReturnValue(of(apiResponse));

    await expect(firstValueFrom(service.getDefaultWatchlist())).resolves.toEqual(
      normalizeWatchlist(apiResponse),
    );
    expect(httpClient.get).toHaveBeenCalledWith(`${apiUrl}/default`);
  });

  it('should get a watchlist by id', async () => {
    const apiResponse = buildApiWatchlist({ id: 7, name: 'Income' });
    httpClient.get.mockReturnValue(of(apiResponse));

    await expect(firstValueFrom(service.getWatchlistById(7))).resolves.toEqual(
      normalizeWatchlist(apiResponse),
    );
    expect(httpClient.get).toHaveBeenCalledWith(`${apiUrl}/7`);
  });

  it('should create a watchlist with the provided payload', async () => {
    const payload: CreateWatchlistRequest = {
      name: 'Momentum',
      description: 'High conviction ideas',
      isDefault: false,
    };
    const apiResponse = buildApiWatchlist({
      id: 3,
      ...payload,
    });
    httpClient.post.mockReturnValue(of(apiResponse));

    await expect(firstValueFrom(service.createWatchlist(payload))).resolves.toEqual(
      normalizeWatchlist(apiResponse),
    );
    expect(httpClient.post).toHaveBeenCalledWith(apiUrl, payload);
  });

  it('should update a watchlist with the provided payload', async () => {
    const payload: UpdateWatchlistRequest = {
      name: 'Updated Watchlist',
      description: null,
      isDefault: true,
    };
    const apiResponse = buildApiWatchlist({
      id: 4,
      ...payload,
    });
    httpClient.put.mockReturnValue(of(apiResponse));

    await expect(firstValueFrom(service.updateWatchlist(4, payload))).resolves.toEqual(
      normalizeWatchlist(apiResponse),
    );
    expect(httpClient.put).toHaveBeenCalledWith(`${apiUrl}/4`, payload);
  });

  it('should add a stock to a watchlist', async () => {
    const apiResponse = buildApiWatchlist({ stockIds: [1, 2, 99] });
    httpClient.post.mockReturnValue(of(apiResponse));

    await expect(firstValueFrom(service.addStockToWatchlist(1, 99))).resolves.toEqual(
      normalizeWatchlist(apiResponse),
    );
    expect(httpClient.post).toHaveBeenCalledWith(`${apiUrl}/1/stocks/99`, null);
  });

  it('should remove a stock from a watchlist', async () => {
    const apiResponse = buildApiWatchlist({ stockIds: [1] });
    httpClient.delete.mockReturnValue(of(apiResponse));

    await expect(firstValueFrom(service.removeStockFromWatchlist(1, 2))).resolves.toEqual(
      normalizeWatchlist(apiResponse),
    );
    expect(httpClient.delete).toHaveBeenCalledWith(`${apiUrl}/1/stocks/2`);
  });

  it('should delete a watchlist', async () => {
    httpClient.delete.mockReturnValue(of(undefined));

    await expect(firstValueFrom(service.deleteWatchlist(5))).resolves.toBeUndefined();
    expect(httpClient.delete).toHaveBeenCalledWith(`${apiUrl}/5`);
  });
});
