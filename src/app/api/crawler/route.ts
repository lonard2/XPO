import { NextRequest, NextResponse } from "next/server";
import {
  runVenueCrawlerBatch,
  getCrawlHistory,
  VENUE_SCRAPER_SOURCES,
  type CrawlBatchOptions,
} from "@/lib/crawler/venueScraper";

export async function GET(req: NextRequest) {
  try {
    const history = getCrawlHistory();
    const availableVenues = Object.entries(VENUE_SCRAPER_SOURCES).map(([slug, data]) => ({
      slug,
      venueName: data.venueName,
      regionCode: data.regionCode,
      feedEventCount: data.feed.length,
    }));

    return NextResponse.json({
      success: true,
      registeredScrapers: availableVenues,
      totalVenuesConfigured: availableVenues.length,
      historyCount: history.length,
      lastRun: history[0] || null,
      history,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: `Failed to retrieve crawler status: ${(error as Error).message}`,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    let body: CrawlBatchOptions = {};
    try {
      body = await req.json();
    } catch {
      // Empty body is valid (runs default full crawl)
    }

    const runRecord = await runVenueCrawlerBatch({
      venueSlugs: body.venueSlugs,
      dryRun: body.dryRun ?? false,
      persistToDb: body.persistToDb ?? true,
    });

    return NextResponse.json({
      success: true,
      data: runRecord,
      message: `Successfully executed crawler batch '${runRecord.runId}': ${runRecord.insertedCount} new events normalized/inserted, ${runRecord.skippedDuplicatesCount} duplicates skipped.`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: `Crawler execution error: ${(error as Error).message}`,
      },
      { status: 500 }
    );
  }
}
